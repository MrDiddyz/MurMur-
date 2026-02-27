from collections import defaultdict


class EventBus:
    def __init__(self):
        self.listeners = defaultdict(list)

    def subscribe(self, event, fn):
        self.listeners[event].append(fn)

    def publish(self, event, data):
        for fn in self.listeners[event]:
            fn(data)


bus = EventBus()
