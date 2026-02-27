import Foundation
import SwiftUI

final class CameraManager: ObservableObject {
    @Published var isRunning = false

    func start() {
        isRunning = true
    }

    func stop() {
        isRunning = false
    }
}
