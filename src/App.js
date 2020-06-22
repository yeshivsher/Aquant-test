import React, { useState, useEffect, Fragment } from "react";
import { withStyles } from '@material-ui/styles'
import { Viewer, ImageryLayer } from "resium"
import { Label, OpenStreetMapImageryProvider } from 'cesium'
import { makeStyles } from "@material-ui/styles";

// locals
import './App.css';
import logo from './logo.svg';
import {
	SetMouseEventListenerPolygon,
	SetMouseEventListener,
	cesiumViewerConfigurations,
	getCZMLtemplate,
	destroyHandler
} from './api/cesium-api'
import SidePanel from './SidePanel'

const useStyles = makeStyles(() => ({
	mapContainer: {
		padding: "0 !important",
		width: '100%',
		position: 'absolute',
		height: "100%",
		"& .cesium-viewer .cesium-viewer-bottom": {
			display: 'none'
		},
		overflowY: 'hidden',
	},
	buttons: {
		color: '#fff',
		background: 'gray'
	},
	secondLeyer: {
		position: 'absolute',
	},
	textField: {
		background: '#fff'
	},
	layersContainer: {
		display: 'flex',
	},
	octiaLogo: {
		width: 60,
		height: 65,
		position: 'absolute',
		right: 10,
		bottom: 35,
	}
}));

const App = () => {
	// global
	const cesiumViewerRef = React.useRef()

	// props
	const classes = useStyles();

	// locals
	const [cesiumRefElement, setCesiumRefElement] = useState({});
	const [mapMouseListener, setMapMouseListener] = useState(false)

	// #region component lifecycle
    /*
        Flow:
        1. init the viewer.
        2. make sure map is ready.
    */

	// 1.
	useEffect(() => {
		console.log("TCL: useEffect init cesiumViewerRef")
		console.log("App -> cesiumViewerRef", cesiumViewerRef)
		if (cesiumViewerRef.current !== null) {
			setCesiumRefElement(cesiumViewerRef)
		}
	}, [])

	// 2.
	useEffect(() => {
		console.log("TCL: useEffect cesiumRefElement")

		const initApp = async () => {
			if (cesiumRefElement.current) {
				console.log('map is ready!')
			}
		}

		// call only when cesiumRefElement created.
		if (Object.keys(cesiumRefElement).length !== 0) {
			initApp()
		}

		return () => {
			// releas event listener.
			console.log("App -> return")
			destroyHandler()
		}
	}, [cesiumRefElement])
	// #endregion

	return (
		<div className={classes.layersContainer}>
			<Viewer
				id="mapContainer"
				navigationHelpButton={false}
				timeline={false}
				animation={false}
				className={classes.mapContainer}
				ref={cesiumViewerRef}
				fullscreenButton={false}
			>
				{
					mapMouseListener &&
					<SetMouseEventListener ref={cesiumViewerRef} />
				}
				<SidePanel
					setMapMouseListener={setMapMouseListener}
					mapMouseListener={mapMouseListener} />
			</Viewer>
		</div>
	);
}

export default App;
