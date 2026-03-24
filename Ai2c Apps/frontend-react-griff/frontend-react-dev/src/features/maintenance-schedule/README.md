# Maintenance Schedule Description

### Motivation:

The maintenance schedule feature is built to support the planning and synchronization of aviation scheduled maintenance activities. The design draws inspiration from a Gantt chart and includes custom features in the form of a bank time projection chart and a phase details table. This feature aims to consolidate all the information an Aviation maintenance manager at Battalion or Brigade echelons needs to manage a scheduled maintenance program.

### Component Description:

**Introduction.** The core component of this feature is the Maintenance Calendar. This calendar is built from scratch using common HTML components and dynamically defined custom CSS rules. Before building this component this way the team explored other tools including Plotly.js, D3.js, and Frappe Gantt. Each of these options restricted the teams ability to represent the realities and challenges of scheduling aviation maintenance. <b>Specific issues included the handling of double booked lanes, customization of bar text, and user interaction behaviors.</b>

**High Level Code Structure.** The MaintenanceCalendar component is the base and is instantiated by passing an array of events to display on the calendar to it. The VerticalToolbar is intended to be displayed next to it and does not take any inputs. The toolbar and calendar share state via the maintenanceScheduleSlice redux store. From top to bottom, the MaintenanceCalendar component contains a DateRangeNavigation component and CalendarFilter component. The main body of the calendar is split into a left and right side. The left side includes lane details and carries consistent grouping (LaneGroupLeft) with the right side (LaneGroupRight). The right side includes both the calendar elements depicting the day along the top and the main calendar component where scheduled maintenance actions are depicted in LaneEvents.

**Lane Group Code Structure.** Lane grouping elements are split into their left and right side elements (this provides a useful default sticky behavior with the left side when the right scrolls). Lane groups are dynamically defined by users and can be grouped by the unit performing the phase, unit the aircraft belong to, model (UH-60M) of the aircraft, or model family (Black Hawk) of the aircraft.

Starting with the LaneGroupLeft component, the lanes are depicted by iterating through lane groups and then through lanes within those groups to show their LaneTypeIndicator followed by their name. The LaneTypeIndicator displays quickly for a user if the lane is military (green) or contractor (blue) and being completed internal (solid) or external (dashed) to their brigade.

Continuing with the LaneGroupRight component, the lanes are depicted by iterating through lane groups and then through lanes within those groups. The row for an individual lane is then created with its contained LaneGridColumns. The LaneGridColumns creates a grid aligned with the calendar dates from the top of the screen and anchors the start and end of each LaneEvent. The maintenance events are shown by creating LaneEvents as boxes with custom background, border, status icons, and quick reference text.

**Other Calendar Events.** Finally, the calendar is made to depict other events on a units training schedule and DONSAs (Day of No Scheduled Activities). These dates are depicted with a highlighted background style on the calendar to draw attention to them when scheduling and referencing the calendar. A special event notifier is used to depict the current day as a single blue line superimposed over the rest of the chart.
