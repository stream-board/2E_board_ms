import { EventEmitter } from 'events'
import mockgoose from 'mockgoose'
import mongoose from '../app/services/mongoose'
import { mongo } from '../app/config'

EventEmitter.defaultMaxListeners = Infinity
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

global.Array = Array
global.Date = Date
global.Function = Function
global.Math = Math
global.Number = Number
global.Object = Object
global.RegExp = RegExp
global.String = String
global.Uint8Array = Uint8Array
global.WeakMap = WeakMap
global.Set = Set
global.Error = Error
global.TypeError = TypeError
global.parseInt = parseInt
global.parseFloat = parseFloat

beforeAll(async () => {
})

afterAll(() => {
})

afterEach(async () => {
})
