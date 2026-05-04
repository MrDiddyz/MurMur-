// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MurMurDrone",
    platforms: [
        .iOS(.v16),
        .macOS(.v13),
    ],
    targets: [
        .target(
            name: "MurMurDrone",
            path: "Sources/MurMurDrone"
        )
    ]
)
