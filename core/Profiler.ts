import { Writer } from "./FileManager.ts";
import { Log } from "./Log.ts"

export class Profiler {
    public static beginProfile(name: string, filepath: string = 'results.json') {
        Instrumentor.get().beginSession(name, filepath);
    }

    public static endProfile() {
        Instrumentor.get().endSession();
    }

    public static ProfileScope(scopeName: string) {
        return new Timer(scopeName);
    }
}

class Timer {
    name: string;
    stopped: boolean
    startTime: number;

    // starts timer
    constructor(name: string) {
        this.name = name;
        this.stopped = false;

        this.startTime = performance.now();
    }

    // stops timer
    scopeEnd() {
        const stopTime = performance.now(); 

        this.stopped = true;

        const duration = stopTime - this.startTime;

        Instrumentor.get().writeProfile(new ProfileResult(this.name, duration, this.startTime));

        Log.Core_Info(`${this.name} duration: ${duration}ms`);
    }
}

class ProfileResult {

    private _name: string;
    private _duration: number;
    private _start: number;

    constructor(name: string, duration: number, start: number) {
        this._name = name;
        this._duration = duration;
        this._start = start;
    }

    public get name() {
        return this._name;
    }

    public get duration() {
        return this._duration;
    }

    public get start() {
        return this._start;
    }
}

class InstrumentationSession {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

class Instrumentor {
    static Instance: Instrumentor; 

    currentSession: InstrumentationSession;
    output: string;
    profileCount: number;
    filepath: string;

    constructor() {
        this.writeProfile = this.writeProfile.bind(this);

        this.currentSession = undefined;
        this.output = '';
        this.profileCount = 0;
        this.filepath = '';
    }

    beginSession(name, filepath) {
        this.output = '';
        this.writeHeader();
        this.currentSession = new InstrumentationSession(name);
        this.filepath = filepath;
    }

    endSession() {
        this.writeFooter();

        //download the file
        Writer.saveStringAsJson(this.output, this.filepath);

        this.currentSession = undefined;
        this.profileCount = 0;
    }

    writeProfile(profileResult: ProfileResult) {
        if (this.profileCount++ > 0) {
            this.output += ',';
        }

        const name = profileResult.name;

        this.output += '{';
        this.output += '"cat": "function",';
        this.output += `"dur":${profileResult.duration},`;
        this.output += `"name":"${name}",`;
        this.output += `"ph":"X",`;
        this.output += `"pid":0,`;
        this.output += `"tid":0,`;
        this.output += `"ts":${profileResult.start}`;
        this.output += `}`;
    }

    writeHeader() {
        this.output += '{"otherData": {}, "traceEvents":[';
    }

    writeFooter() {
        this.output += ']}';
    }

    static get() {
        if (typeof this.Instance == 'undefined') {
            this.Instance = new Instrumentor();
        }

        return this.Instance;
    }
}