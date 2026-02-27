import Foundation
import SwiftUI

final class LearningEngine: ObservableObject {
    @Published var adaptationLevel: Double = 0.3
    @Published var brandProfile: BrandProfile = .default

    func reinforcePositiveSignal() {
        adaptationLevel = min(1.0, adaptationLevel + 0.05)
    }
}
