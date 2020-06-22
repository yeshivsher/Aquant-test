import React from 'react';
import { withStyles } from '@material-ui/styles'
import { Grid } from "@material-ui/core"
import Button from '@material-ui/core/Button';
import { Tooltip } from "@material-ui/core"
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(() => ({
    root: {
        height: 290,
        width: 200,
        position: 'absolute',
        bottom: '45%',
        right: 9,
        zIndex: 100,
        borderRadius: 24,
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'column'
    },
    distanceFab: {
        width: '80px !important',
        height: '50px !important',
        left: 90,
        borderRadius: 5,
        marginBottom: 20,
        color: 'white',
        background: '#2196F3'
    },
}));

const SidePanel = React.memo((props) => {
    console.log("TCL: SidePanel")
    
    // props.
	const classes = useStyles();
    const {
        setMapMouseListener,
        mapMouseListener
    } = props

    const distanceFabOnClick = () => {
        let mouseType

        if ((!mapMouseListener)) {
            mouseType = "crosshair"
        } else {
            mouseType = "default"
        }

        document.getElementById("mapContainer").style.cursor = mouseType
        setMapMouseListener((!mapMouseListener))
    }

    return (
        <div
            className={classes.root}
        >
            <Tooltip placement="left" title="Create a polygon, double click to enter new one.">
                <Button
                    className={classes.distanceFab}
                    onClick={distanceFabOnClick}
                >
                    Polygon
                </Button>
            </Tooltip>
        </div >
    )
})

export default SidePanel
