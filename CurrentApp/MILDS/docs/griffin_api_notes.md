# Griffin API – MiLDS Integration Notes

## Base URL
http://127.0.0.1:8001

---

## 1. Get Aircraft by Unit (READ)

**Endpoint**
GET /aircraft/shiny/dsr/{uic}

**Used by**
MiLDS → Griffin sync

**Path Parameters**
- uic (string) – Unit identifier (e.g. WDDRA0)

**Response Shape**
{
  "aircraft": [ ... ],
  "inspections": [ ... ],
  "syncs": [ ... ]
}

**Fields Consumed by MiLDS**
- aircraft.serial
- aircraft.model
- aircraft.status
- aircraft.rtl
- aircraft.current_unit
- aircraft.total_airframe_hours
- aircraft.hours_to_phase
- aircraft.remarks
- aircraft.last_sync_time
- aircraft.last_update_time
- aircraft.last_export_upload_time

**Ignored Fields**
- inspections
- syncs
- should_sync
- flight_hours (not used yet)

---

## 2. Update Aircraft (WRITE / INJECT)

**Endpoint**
PATCH /aircraft/update/{serial}

**Used by**
MiLDS inject actions (Break button, field updates)

**Path Parameters**
- serial (string) – Aircraft serial (e.g. 26-0001)

**Request Body**
JSON object with updated fields

Example:
{
  "status": "NMC"
}

**Success Responses**
- 200 OK
- 204 No Content

**Failure Handling**
- Non-200/204 treated as error
- Connection errors surfaced to MiLDS