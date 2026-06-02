import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Patch 1: apple-sign-in — fix capacitor-swift-pm version constraint (7.x → 8.x)
const appleSignInSwift = resolve(
  root,
  "node_modules/@capacitor-community/apple-sign-in/Package.swift"
);
if (existsSync(appleSignInSwift)) {
  const content = readFileSync(appleSignInSwift, "utf8");
  const patched = content.replace(
    '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")',
    '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")'
  );
  if (content !== patched) {
    writeFileSync(appleSignInSwift, patched);
    console.log("Patched @capacitor-community/apple-sign-in Package.swift");
  } else {
    console.log("@capacitor-community/apple-sign-in already patched");
  }
}

// Patch 2: capacitor-google-auth — inject Package.swift (no SPM support in plugin)
const googleAuthPackageSwift = resolve(
  root,
  "node_modules/@codetrix-studio/capacitor-google-auth/Package.swift"
);
const googleAuthPackageContent = `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorGoogleAuth",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "CodetrixStudioCapacitorGoogleAuth",
            targets: ["CodetrixStudioCapacitorGoogleAuth"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/google/GoogleSignIn-iOS.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "CodetrixStudioCapacitorGoogleAuthObjC",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Plugin",
            sources: ["Plugin.m"],
            publicHeadersPath: "."
        ),
        .target(
            name: "CodetrixStudioCapacitorGoogleAuth",
            dependencies: [
                "CodetrixStudioCapacitorGoogleAuthObjC",
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "GoogleSignIn", package: "GoogleSignIn-iOS")
            ],
            path: "ios/Plugin",
            sources: ["Plugin.swift"]
        )
    ]
)
`;
writeFileSync(googleAuthPackageSwift, googleAuthPackageContent);
console.log("Patched @codetrix-studio/capacitor-google-auth Package.swift");

// Patch 3: capacitor-google-auth — rewrite Plugin.swift for GoogleSignIn 7.x API
const googleAuthPluginSwift = resolve(
  root,
  "node_modules/@codetrix-studio/capacitor-google-auth/ios/Plugin/Plugin.swift"
);
const googleAuthPluginContent = `import Foundation
import Capacitor
import GoogleSignIn

@objc(GoogleAuth)
public class GoogleAuth: CAPPlugin {
    var signInCall: CAPPluginCall!
    var googleSignIn: GIDSignIn!
    var forceAuthCode: Bool = false
    var additionalScopes: [String]!
    var clientId: String?
    var serverClientId: String?

    func loadSignInClient(customClientId: String, customScopes: [String]) {
        googleSignIn = GIDSignIn.sharedInstance
        clientId = customClientId
        serverClientId = getServerClientIdValue()

        let defaultGrantedScopes = ["email", "profile", "openid"]
        additionalScopes = customScopes.filter { !defaultGrantedScopes.contains($0) }
        forceAuthCode = getConfig().getBoolean("forceCodeForRefreshToken", false)

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleOpenUrl(_:)),
            name: Notification.Name(Notification.Name.capacitorOpenURL.rawValue),
            object: nil
        )
    }

    public override func load() {
        googleSignIn = GIDSignIn.sharedInstance
        if let cId = getClientIdValue() {
            serverClientId = getServerClientIdValue()
            googleSignIn.configuration = GIDConfiguration(clientID: cId, serverClientID: serverClientId)
            let defaultGrantedScopes = ["email", "profile", "openid"]
            additionalScopes = (getConfigValue("scopes") as? [String] ?? []).filter {
                !defaultGrantedScopes.contains($0)
            }
            forceAuthCode = getConfig().getBoolean("forceCodeForRefreshToken", false)
            NotificationCenter.default.addObserver(
                self,
                selector: #selector(handleOpenUrl(_:)),
                name: Notification.Name(Notification.Name.capacitorOpenURL.rawValue),
                object: nil
            )
        }
    }

    @objc func initialize(_ call: CAPPluginCall) {
        guard let cId = call.getString("clientId") ?? getClientIdValue() else {
            NSLog("no client id found in config")
            call.resolve()
            return
        }
        let customScopes = call.getArray("scopes", String.self) ?? (getConfigValue("scopes") as? [String] ?? [])
        forceAuthCode = call.getBool("grantOfflineAccess") ?? (getConfigValue("forceCodeForRefreshToken") as? Bool ?? false)
        loadSignInClient(customClientId: cId, customScopes: customScopes)
        call.resolve()
    }

    @objc func signIn(_ call: CAPPluginCall) {
        signInCall = call
        guard googleSignIn != nil else {
            call.reject("GoogleAuth not initialized. No client ID found.")
            return
        }
        DispatchQueue.main.async {
            if self.googleSignIn.hasPreviousSignIn() && !self.forceAuthCode {
                self.googleSignIn.restorePreviousSignIn { user, error in
                    if let error = error {
                        self.signInCall?.reject(error.localizedDescription)
                        return
                    }
                    self.resolveSignInCallWith(user: user!, serverAuthCode: nil)
                }
            } else {
                guard let presentingVc = self.bridge?.viewController else {
                    self.signInCall?.reject("No view controller available")
                    return
                }
                self.googleSignIn.signIn(withPresenting: presentingVc, hint: nil, additionalScopes: self.additionalScopes ?? []) { result, error in
                    if let error = error {
                        self.signInCall?.reject(error.localizedDescription, "\\((error as NSError).code)")
                        return
                    }
                    guard let result = result else {
                        self.signInCall?.reject("No result returned")
                        return
                    }
                    self.resolveSignInCallWith(user: result.user, serverAuthCode: result.serverAuthCode)
                }
            }
        }
    }

    @objc func refresh(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let currentUser = self.googleSignIn.currentUser else {
                call.reject("User not logged in.")
                return
            }
            currentUser.refreshTokensIfNeeded { user, error in
                if let error = error {
                    call.reject(error.localizedDescription)
                    return
                }
                guard let user = user else {
                    call.reject("No user returned")
                    return
                }
                let authenticationData: [String: Any] = [
                    "accessToken": user.accessToken.tokenString,
                    "idToken": user.idToken?.tokenString ?? NSNull(),
                    "refreshToken": user.refreshToken.tokenString
                ]
                call.resolve(authenticationData)
            }
        }
    }

    @objc func signOut(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.googleSignIn.signOut()
        }
        call.resolve()
    }

    @objc func handleOpenUrl(_ notification: Notification) {
        guard let object = notification.object as? [String: Any],
              let url = object["url"] as? URL else { return }
        googleSignIn.handle(url)
    }

    func getClientIdValue() -> String? {
        if let id = getConfig().getString("iosClientId") { return id }
        if let id = getConfig().getString("clientId") { return id }
        if let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
           let dict = NSDictionary(contentsOfFile: path) as? [String: AnyObject],
           let id = dict["CLIENT_ID"] as? String { return id }
        return nil
    }

    func getServerClientIdValue() -> String? {
        return getConfig().getString("serverClientId")
    }

    func resolveSignInCallWith(user: GIDGoogleUser, serverAuthCode: String?) {
        var userData: [String: Any] = [
            "authentication": [
                "accessToken": user.accessToken.tokenString,
                "idToken": user.idToken?.tokenString ?? NSNull(),
                "refreshToken": user.refreshToken.tokenString
            ],
            "serverAuthCode": serverAuthCode ?? NSNull(),
            "email": user.profile?.email ?? NSNull(),
            "familyName": user.profile?.familyName ?? NSNull(),
            "givenName": user.profile?.givenName ?? NSNull(),
            "id": user.userID ?? NSNull(),
            "name": user.profile?.name ?? NSNull()
        ]
        if let imageUrl = user.profile?.imageURL(withDimension: 100)?.absoluteString {
            userData["imageUrl"] = imageUrl
        }
        signInCall?.resolve(userData)
    }
}
`;
writeFileSync(googleAuthPluginSwift, googleAuthPluginContent);
console.log("Patched @codetrix-studio/capacitor-google-auth Plugin.swift");
