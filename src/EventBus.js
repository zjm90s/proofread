import mitt from 'mitt'

class QueueEventBus {
    constructor() {
        this.emitter = mitt()
        this.queue = {} // 用于存储未处理的消息
        this.subscribers = {} // 用于跟踪每个事件的订阅者数量
    }

    on(event, handler) {
        // 注册事件监听器
        if (!this.subscribers[event]) {
            this.subscribers[event] = 0
        }
        this.subscribers[event] += 1

        // 添加事件处理器
        this.emitter.on(event, handler)

        // 处理未处理的消息
        if (this.queue[event]) {
            this.queue[event].forEach(payload => handler(payload))
            this.queue[event] = [] // 清空队列
        }
    }

    off(event, handler) {
        // 注销事件监听器
        if (this.subscribers[event]) {
            this.subscribers[event] -= 1
            if (this.subscribers[event] <= 0) {
                this.subscribers[event] = 0
                this.emitter.off(event, handler)
            }
        }
    }

    emit(event, payload, onlyLatest = true) {
        // 触发事件
        if (this.subscribers[event] > 0) {
            this.emitter.emit(event, payload)
        } else {
            // 如果没有订阅者，事件存储在队列中
            if (onlyLatest) {
                this.queue[event] = [payload]
            } else {
                if (!this.queue[event]) {
                    this.queue[event] = []
                }
                this.queue[event].push(payload)
            }
        }
    }
}

const EventBus = new QueueEventBus()
export default EventBus