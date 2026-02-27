import Foundation

struct BrandProfile: Equatable {
    var title: String
    var tone: String
    var preferredMode: SceneMode

    static let `default` = BrandProfile(
        title: "MurMur",
        tone: "Cinematic",
        preferredMode: .cinematic
    )
}
