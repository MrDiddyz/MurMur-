import Foundation

enum SceneMode: String, CaseIterable, Identifiable {
    case cinematic
    case dramatic
    case documentary
    case dreamscape

    var id: String { rawValue }

    var displayName: String {
        rawValue.capitalized
    }
}
