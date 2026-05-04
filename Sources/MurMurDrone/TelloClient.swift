import Foundation

class TelloClient: ObservableObject {
    @Published var status: String = "disconnected"
    @Published var lastResponse: String = ""

    func connect() {}
    func startSDK() {}
    func takeoff() {}
    func land() {}
    func stop() {}
    func rc(lr: Int, fb: Int, ud: Int, yaw: Int) {}
}
