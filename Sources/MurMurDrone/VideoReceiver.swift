import Foundation
import CoreVideo

class VideoDecoder {
    var onFrame: ((CVPixelBuffer) -> Void)?
}

class VideoReceiver: ObservableObject {
    let decoder = VideoDecoder()

    func start() throws {}
}
