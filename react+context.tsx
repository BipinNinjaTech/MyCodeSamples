import React from 'react'
import { DetectedObject } from '../../types/object'
import { UserDefinedFrameObject } from "../../types/frame";
import { RedactEditorState } from './types'

const defaultValue: RedactEditorState = {
    objectMap: new Map<string, DetectedObject>(),
    detectedObjects: [],
    regionOfInterest:[],
    frames: [],
    audioPeakUrls: [],
    description: '',
    name: '',
    originalFileExtension: '',
    confidence: 0.5,
    projectId: null,
    focusedItem: undefined,
    deletedObjects: [],
    toggleCanvasRefresh: false,
    isModified: true,
    currentFrameTime: 0,
    frameRate: 0,
    frameCount: 0,
    frameHeight: 0,
    frameWidth: 0,
    setProject: (id, project) => { console.log(`default state called with projectId ${id}`) },
    setCurrentObjectId: (objectId: string) => console.log(`default state called with setCurrentObject ${objectId}`),
    updateDetectedObjectList: (objects) => { console.log(`default state called with detected object list ${objects}`) },
    setCurrentROIObjectId: (objectId: string) => console.log(`default state called with setCurrentROIObjectId ${objectId}`),
    updateROIObjectList: (list) => { console.log(`default state called with ROI object list ${list}`) },
    setAudioChannels: (channels) => { console.log(`default state called with Channels object list ${channels}`) },
    setCurrentAudioSegment: (channelId, segmentId) => { console.log(`default state called with empty values`)},
    setCanvas: (canvas) => {console.log(`default state called with empty values`)},
    setVideoPlayer: (player, element) => {console.log(`default state called with empty values`)},
    setFrames: (frames) => {console.log(`default state called with empty values`)},
    setCurrentFrameTime: (currentFrameTime) => {},
    setMultiFocusObjects: (objects: DetectedObject[]) => {},
    resetModifiedStatus: () => {},
    resetState: () => {}
}

const RedactEditorContext = React.createContext(defaultValue)

export default RedactEditorContext