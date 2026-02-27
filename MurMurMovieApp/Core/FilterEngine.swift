import Foundation
import SwiftUI

final class FilterEngine: ObservableObject {
    @Published var intensity: Double = 0.6
    @Published var selectedMode: SceneMode = .cinematic

    var activeFilterName: String {
        "\(selectedMode.displayName) • \(Int(intensity * 100))%"
    }
}
