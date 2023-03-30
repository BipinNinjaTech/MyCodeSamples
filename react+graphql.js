import React, { useContext, useState, useEffect } from "react";
import { useMutation, useLazyQuery } from "@apollo/client";
import { makeStyles } from "@material-ui/core/styles";
import ToggleButton from "@material-ui/lab/ToggleButton";
import MyLocationIcon from "@material-ui/icons/MyLocation";
import Tooltip from "@material-ui/core/Tooltip";
import { AppContext } from "../../AppContext";
import { TOGGLETRACK } from "../../graphQL/useMutationToggleCreateRemoveTrack";
import { CircularProgress } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    width: (props) => (props.iconZiseSmall ? "30px" : "48px"),
    height: (props) => (props.iconZiseSmall ? "30px" : "48px"),
    borderRadius: "50%",
    border: 0,
    color: (props) => (props.dark ? "rgb(1,17,51)" : "#fff"),
    // backgroundColor: "transparent !important",
    "&:hover": {
      backgroundColor: (props) =>
        props.dark ? "#dadbde88 !important" : "#031d40 !important",
    },
  },
  aaa: { backgroundColor: "green" },
  hiddenLoader: {
    position: "absolute",
    backgroundColor: "#EDF8FC",
    borderRadius: "50%",
    visibility: "hidden", //visible
  },
  activeTrack: {
    fill: `${theme.palette.secondary.main} !important`,
  },
}));

export default function TrackToggleButton(props) {
  let classes = useStyles(props);
  const [stateApp] = useContext(AppContext);
  const [selected, setSelected] = useState(false);
  const [toggleCreateRemoveTrack, { data, loading }] = useMutation(TOGGLETRACK);

  useEffect(() => {
    //// if selected multiple buttons set all loader
    if (props.multipleIds) {
      if (loading) {
        for (let i = 0; i < props.multipleIds.length; i++) {
          if (
            document.getElementById(
              props.targetLabel + props.multipleIds[i] + "loader"
            )
          )
            document.getElementById(
              props.targetLabel + props.multipleIds[i] + "loader"
            ).style.visibility = "visible";
        }
      } else {
        for (let i = 0; i < props.multipleIds.length; i++) {
          if (
            document.getElementById(
              props.targetLabel + props.multipleIds[i] + "loader"
            )
          )
            document.getElementById(
              props.targetLabel + props.multipleIds[i] + "loader"
            ).style.visibility = "hidden";
        }
      }
    }
  }, [loading, props.multipleIds]);

  useEffect(() => {
    if (props.target) {
      if (props.target.isTracked) {
        setSelected(true);
      } else {
        setSelected(false);
      }
    }
  }, [props.target]);

  useEffect(() => {
    if (
      data &&
      data.toggleCreateRemoveTrack &&
      data.toggleCreateRemoveTrack.success
    ) {
      setSelected(data.toggleCreateRemoveTrack.tracking);
    }
  }, [data]);

  const handleToggle = () => {
    if (!props.multipleIds || !props.multipleTracks) {
      toggleCreateRemoveTrack({
        variables: {
          track: {
            user: stateApp.user.mongoId,
            objectType: props.targetLabel,
            trackOn: props.targetSourceId.toLowerCase(),
          },
        },
        refetchQueries: ["tracksByObjectType", "trackByObjectId"], ////add all queries for components with track icons////
        awaitRefetchQueries: true,
      });
    } else {
      for (let i = 0; i < props.multipleIds.length; i++) {
        if (
          props.multipleIds.indexOf(props.multipleIds[i]) === i && //// only first time it's appear if duplicated
          props.target.isTracked === props.multipleTracks[i]
        ) {
          toggleCreateRemoveTrack({
            variables: {
              track: {
                user: stateApp.user.mongoId,
                objectType: props.targetLabel,
                trackOn: props.multipleIds[i].toLowerCase(),
              },
            },
            refetchQueries: ["tracksByObjectType", "trackByObjectId"], ////add all queries for components with track icons////
            awaitRefetchQueries: true,
          });
        }
      }
    }
  };

  return (
    <Tooltip
      title={`${props.target.isTracked ? "Untrack" : "Track"}${
        props.targetLabel
          ? " " +
            props.targetLabel.charAt(0).toUpperCase() +
            props.targetLabel.slice(1)
          : ""
      }${props.targetLabel && props.multiSelectMouseHoverColor ? "s" : ""}`}
      placement="top"
    >
      <ToggleButton
        style={{
          backgroundColor: "transparent",
        }}
        id={props.id ? props.id : ""}
        size="small"
        className={classes.root}
        value="check"
        selected={selected}
        onChange={(e) => {
          e.stopPropagation();
          e.persist();
          handleToggle();
        }}
        onMouseOver={(e) => {
          if (props.multiSelectMouseHoverColor && props.idBase)
            props.multiSelectMouseHoverColor(props.idBase, "#dadbde");
        }}
        onMouseOut={(e) => {
          if (props.multiSelectMouseHoverColor && props.idBase)
            props.multiSelectMouseHoverColor(props.idBase, "transparent");
        }}
      >
        {loading ? (
          <CircularProgress
            size={props.iconZiseSmall ? 18 : 28}
            color="secondary"
          />
        ) : selected ? (
          <>
            <MyLocationIcon className={classes.activeTrack} color="secondary" />
            <CircularProgress
              className={classes.hiddenLoader}
              id={props.targetLabel + props.targetSourceId + "loader"}
              size={props.iconZiseSmall ? 18 : 28}
              color="secondary"
            />
          </>
        ) : (
          <>
            <MyLocationIcon />
            <CircularProgress
              className={classes.hiddenLoader}
              id={props.targetLabel + props.targetSourceId + "loader"}
              size={props.iconZiseSmall ? 18 : 28}
              color="secondary"
            />
          </>
        )}
      </ToggleButton>
    </Tooltip>
  );
}
