"""
Human-readable labels for the coded categorical columns in AccidentsBig.csv.

The dataset follows the UK DfT STATS19 "Road Accident" coding scheme. These
mappings are based on the standard STATS19 coding manual; verify against your
copy's data dictionary if values fall outside the ranges below (unmapped codes
render as "Unknown (<code>)" rather than raising an error).
"""

ACCIDENT_SEVERITY = {1: "Fatal", 2: "Serious", 3: "Slight"}

DAY_OF_WEEK = {
    1: "Sunday",
    2: "Monday",
    3: "Tuesday",
    4: "Wednesday",
    5: "Thursday",
    6: "Friday",
    7: "Saturday",
}

ROAD_TYPE = {
    1: "Roundabout",
    2: "One way street",
    3: "Dual carriageway",
    6: "Single carriageway",
    7: "Slip road",
    9: "Unknown",
    12: "One way street/Slip road",
}

LIGHT_CONDITIONS = {
    1: "Daylight",
    4: "Darkness - lights lit",
    5: "Darkness - lights unlit",
    6: "Darkness - no lighting",
    7: "Darkness - lighting unknown",
}

WEATHER_CONDITIONS = {
    1: "Fine, no high winds",
    2: "Raining, no high winds",
    3: "Snowing, no high winds",
    4: "Fine, high winds",
    5: "Raining, high winds",
    6: "Snowing, high winds",
    7: "Fog or mist",
    8: "Other",
    9: "Unknown",
}

ROAD_SURFACE_CONDITIONS = {
    1: "Dry",
    2: "Wet or damp",
    3: "Snow",
    4: "Frost or ice",
    5: "Flood over 3cm deep",
    6: "Oil or diesel",
    7: "Mud",
}

URBAN_OR_RURAL_AREA = {1: "Urban", 2: "Rural", 3: "Unallocated"}

JUNCTION_DETAIL = {
    0: "Not at or within 20m of a junction",
    1: "Roundabout",
    2: "Mini-roundabout",
    3: "T or staggered junction",
    5: "Slip road",
    6: "Crossroads",
    7: "More than 4 arms",
    8: "Private drive or entrance",
    9: "Other junction",
}

JUNCTION_CONTROL = {
    -1: "Not applicable",
    0: "Not at junction",
    1: "Authorised person",
    2: "Auto traffic signal",
    3: "Stop sign",
    4: "Give way or uncontrolled",
}

DID_POLICE_OFFICER_ATTEND = {1: "Yes", 2: "No", 3: "No - self reported"}


def label(mapping: dict, code) -> str:
    try:
        code_int = int(code)
    except (TypeError, ValueError):
        return "Unknown"
    return mapping.get(code_int, f"Unknown ({code_int})")
