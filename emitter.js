'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

class ContextHandler {
    constructor(context, handler, times, frequency) {
        this.context = context;
        this.handler = handler;
        this.times = times <= 0 ? Infinity : times;
        this.frequency = frequency <= 0 ? 1 : frequency;
        this.counterTimes = 0;
    }

    emit() {
        if (this.counterTimes < this.times && (this.counterTimes % this.frequency) === 0) {
            this.handler.call(this.context);
        }
        this.counterTimes++;
    }

    toString() {
        return `context: ${this.context.toString()}, handler: ${this.handler.toString()}`;
    }
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    const events = new Map();

    function getContextsHandlerByEvent(event) {
        if (!events.has(event)) {
            events.set(event, []);
        }

        return events.get(event);
    }

    function getContextsHandler(context, handler, times = Infinity, frequency = 1) {
        return new ContextHandler(context, handler, times, frequency);
    }

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            getContextsHandlerByEvent(event).push(getContextsHandler(context, handler));

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            const offEventsReg = new RegExp(`^(?:${event}|(?:${event}\\.+.*))$`);
            const offEvents = Array.from(events.keys()).filter(e => offEventsReg.test(e));

            offEvents.forEach(offEvent => {
                const contextsHandler = events.get(offEvent);
                for (let i = contextsHandler.length - 1; i >= 0; i--) {
                    if (contextsHandler[i].context === context) {
                        contextsHandler.splice(i, 1);
                    }
                }
            });

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            let currentEvent = event;
            let nextEventLength = 0;

            while (nextEventLength !== -1) {
                if (events.has(currentEvent)) {
                    events.get(currentEvent).forEach(ch => ch.emit());
                }

                nextEventLength = currentEvent.lastIndexOf('.');
                currentEvent = currentEvent.substr(0, nextEventLength);
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            getContextsHandlerByEvent(event).push(getContextsHandler(context, handler, times));

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            getContextsHandlerByEvent(event)
                .push(getContextsHandler(context, handler, Infinity, frequency));

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
