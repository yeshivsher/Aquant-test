import React, { Fragment, useState, useEffect } from "react";
import {
    Cartesian3,
    Cartesian2,
    ScreenSpaceEventType,
    Color,
    VerticalOrigin,
    HorizontalOrigin,
    Math as CesiumMath,
    CzmlDataSource as CzmlDataSource_F,
    LabelStyle,
    DistanceDisplayCondition,
    ScreenSpaceEventHandler as ScreenSpaceEventHandler_F,
    knockout,
    Cartographic,
    SingleTileImageryProvider
} from "cesium";
import {
    Entity,
    ModelGraphics,
    CameraFlyTo,
    BillboardGraphics,
    CzmlDataSource,
    ScreenSpaceEventHandler,
    ScreenSpaceEvent,
    PointGraphics,
    EntityDescription,
    Billboard
} from "resium";

// vars.
var handler

// #region Helper Functions
const cesiumObjectPositionsToArray = (positionsObj) => {
    let toArrayPositions = []

    for (let p in positionsObj) {
        let cartographic = Cartographic.fromCartesian(positionsObj[p]);
        let longitudeString = CesiumMath.toDegrees(cartographic.longitude);
        let latitudeString = CesiumMath.toDegrees(cartographic.latitude);

        toArrayPositions.push(longitudeString)
        toArrayPositions.push(latitudeString)
        toArrayPositions.push(0)
    }

    return toArrayPositions
}

const cesiumObjectPositionsToArrayWithNoAlt = (positionsObj) => {
    let toArrayPositions = []

    for (let p in positionsObj) {
        let cartographic = Cartographic.fromCartesian(positionsObj[p]);
        let longitudeString = CesiumMath.toDegrees(cartographic.longitude);
        let latitudeString = CesiumMath.toDegrees(cartographic.latitude);

        toArrayPositions.push(longitudeString)
        toArrayPositions.push(latitudeString)
    }

    return toArrayPositions
}

// { {},{} }
const positionsFromObjToArray = (objPositions, overrideAlt) => {
    let arrayPositions = []
    let alt = overrideAlt !== 0 ? overrideAlt : (objPositions && objPositions[0]) ? objPositions[0].alt : 0

    for (let pos in objPositions) {
        arrayPositions.push(objPositions[pos].lng)
        arrayPositions.push(objPositions[pos].lat)
        arrayPositions.push(alt)
    }

    return arrayPositions
}

const hexToRgbA = (hex, A) => {
    let c

    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('')
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]]
        }
        c = '0x' + c.join('')

        return [(c >> 16) & 255, (c >> 8) & 255, c & 255, A]
    }
}

const getCZMLtemplate = () => {
    return [
        {
            id: "document",
            name: "CZML",
            version: "1.0",
        },
        {
            id: 'current-polygon',
            name: "Current creating polygon",
            polygon: {
                positions: {
                    cartographicDegrees: []
                },
                fill: true,
                outline: true,
                outlineColor: {
                    rgba: [255, 255, 0, 155]
                },
                material: {
                    solidColor: {
                        color: {
                            rgba: [255, 0, 0, 100]
                        },
                    },
                },
            }
        }
    ]
}
// #endregion

const removeAllSites = (ref) => {
    try {
        let viewer = ref.current.cesiumElement

        if (viewer.dataSources.length > 1) {
            viewer.dataSources.removeAll()
        }
    } catch (e) {
    }
}

const removeCurrentCreatingPolygon = (ref) => {
    try {
        let viewer = ref.current.cesiumElement
        let currentCreatingPolygon

        currentCreatingPolygon = viewer.dataSources.getByName('CZML')
        viewer.dataSources.remove(currentCreatingPolygon[0])
    } catch (e) {
    }
}

const removeEntityById = (ref, id) => {
    try {
        let viewer = ref.current.cesiumElement
        let entity = viewer.entities.getById(id)

        viewer.entities.remove(entity)
        return true
    } catch (e) {
        console.log("removeEntityById -> e", e)
    }
}

const SetMouseEventListener = React.forwardRef((props, ref) => {
    let [loc, setLoc] = useState({ lng: 0, lat: 0 })
    let [showPoint, setShowPoint] = useState(false)
    let [polygonPoints, setPolygonPoints] = useState([])
    let [positionsArray, setPositionsArray] = useState([])

    const leftClick = async (e) => {
        const { scene, camera } = ref.current.cesiumElement

        try {
            if (positionsArray.length < 6) {
                const ellipsoid = scene._globe._ellipsoid
                const mousePosition = e.position

                const cartesian = camera.pickEllipsoid(mousePosition)
                const cartographic = ellipsoid.cartesianToCartographic(cartesian)
                const latitude = CesiumMath.toDegrees(cartographic.latitude).toFixed(6)
                const longitude = CesiumMath.toDegrees(cartographic.longitude).toFixed(6)

                let tempPoint = { lat: Number(latitude), lng: Number(longitude) }
                let positionsObj = Cartesian3.fromDegreesArray([
                    ...positionsArray,
                    Number(longitude), Number(latitude)
                ]);
                let tempCzml = getCZMLtemplate()
                let temp
                let tempPolygonPoints
                let positionsWithNoAlt = cesiumObjectPositionsToArrayWithNoAlt(positionsObj)

                setPositionsArray(positionsWithNoAlt)
                setLoc({ ...tempPoint })
                setShowPoint(true)

                temp = { lng: Number(longitude), lat: Number(latitude) }
                tempPolygonPoints = [...polygonPoints]

                tempPolygonPoints.push(temp.lng)
                tempPolygonPoints.push(temp.lat)
                tempPolygonPoints.push(0)
                setPolygonPoints(tempPolygonPoints)

                if (tempCzml[1]) {
                    tempCzml[1].polygon.positions.cartographicDegrees = tempPolygonPoints
                }

                if (tempPolygonPoints.length !== 0) {
                    CreateTempCZML(tempCzml, ref)
                }
            }
        } catch (e) {
            console.log("SetMouseEventListener -> leftClick -> e", e)
        }
    }

    const doubleClick = () => {
        setShowPoint(false)
        setPositionsArray([])
        setPolygonPoints([])
        removeCurrentCreatingPolygon(ref)
    }

    useEffect(function () {
        console.log('useEffect SetMouseEventListener')

        return () => {
            console.log('useEffect SetMouseEventListener -> distructor')
            removeCurrentCreatingPolygon(ref)
            removeEntityById(ref, 'temp--label')
        }
    }, [])

    return (
        <Fragment>
            <ScreenSpaceEventHandler>
                <ScreenSpaceEvent action={leftClick} type={ScreenSpaceEventType.LEFT_CLICK} />
                <ScreenSpaceEvent action={() => doubleClick()} type={ScreenSpaceEventType.LEFT_DOUBLE_CLICK} />
            </ScreenSpaceEventHandler>
            {
                showPoint &&
                <Entity
                    position={Cartesian3.fromDegrees(loc.lng, loc.lat, 1)}
                    point={{ pixelSize: 5, color: Color.BLACK }}
                    zIndex={100}>
                </Entity>
            }
        </Fragment>
    )
})

const CreateTempCZML = (czml, ref) => {
    removeCurrentCreatingPolygon(ref)

    try {
        let viewer = ref.current.cesiumElement
        let dataSource = CzmlDataSource_F.load(czml)

        viewer.dataSources.add(dataSource)
    } catch (e) {
    }
}

const destroyHandler = () => {
    console.log("TCL: destroyHandler -> handler -> before: ", handler)
    handler = handler && handler.destroy();
    console.log("TCL: destroyHandler -> handler -> after: ", handler)
}

export {
    CreateTempCZML,
    destroyHandler,
    removeAllSites,
    removeCurrentCreatingPolygon,
    SetMouseEventListener,
    positionsFromObjToArray,
    getCZMLtemplate,
}