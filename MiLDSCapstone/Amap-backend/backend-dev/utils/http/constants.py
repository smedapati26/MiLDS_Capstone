CONTENT_TYPE_JSON = "application/json"
DATE_FORMAT = "%Y-%m-%d"

# Soldier Errors
HTTP_404_SOLDIER_DOES_NOT_EXIST = "Soldier does not exist."
HTTP_400_SOLDIER_ALREADY_EXIST = "Soldier already exist."
HTTP_400_SOLDIER_CREATE_FAILED_ERROR_MESSAGE = "Unable to create soldier."
# Unit Errors
HTTP_404_UNIT_DOES_NOT_EXIST = "Unit does not exist."
# Permission Request Errors
HTTP_404_REQUEST_DOES_NOT_EXIST = "Elevated permission request does not exist"
HTTP_ERROR_MESSAGE_MULTIPLE_USER_REQUESTS = (
    "Multiple User Requests for this Unit currently exist. Please contact support to help resolve this issue."
)
# Transfer Request Errors
HTTP_404_TRANSFER_REQUEST_DOES_NOT_EXIST = "Soldier transfer request does not exist"
# Flag Errors
HTTP_400_FLAG_REQUIRES_SOLDIER_OR_UNIT = "Flag must be applied to an individual soldier or to a unit"
HTTP_404_FLAG_DOES_NOT_EXIST = "Soldier Flag does not exist"
HTTP_200_FLAG_INFO_CHANGED = "Soldier Flag information successfully updated"
# MOS Errors
HTTP_404_MOS_DOES_NOT_EXIST = "MOS does not exist"
# User Role Errors
HTTP_404_ROLE_DOES_NOT_EXIST = "No such user role exists"
# Task Errors
HTTP_404_ICTL_DOES_NOT_EXIST = "ICTL does not exist"
HTTP_404_TASK_DOES_NOT_EXIST = "Task does not exist"
# Task/Task List Success Messages
HTTP_200_TASKS_ADDED = "Task(s) added to ICTL"
HTTP_200_UNIT_TASK_CREATED = "Unit task successfully created"
HTTP_200_CTL_SAVED = "Unit CTL Saved"
HTTP_200_TASK_INFO_CHANGED = "Task information successfully updated"
HTTP_200_UCTL_INFO_CHANGED = "UCTL information successfully updated"
HTTP_200_TASK_REMOVED = "Task successfully removed from UCTL"
HTTP_200_TASK_DELETED = "Task successfully deleted"
HTTP_200_UCTL_SUPERCEDED = "UCTL successfully superceded"
# HTTP Bad Request Messages
HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST = "Request was not a POST method."
HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY = "Request body JSON data is not formatted properly."
HTTP_ERROR_MESSAGE_REQUEST_BODY_FILES_NOT_FORMATTED_PROPERLY = "Request body FILES data is not formatted properly."
HTTP_ERROR_MESSAGE_TYPE_ERROR = "Incorrect value entered."
HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER = "No User ID passed in header."
HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST = "User ID does not exist."
HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST = "Error: Unit UIC not present in database"
HTTP_PERMISSION_ERROR = "User does not have permission."
HTTP_NO_USER_ROLE = "User does not have a role for this unit."
HTTP_ERROR_MESSAGE_7817_NOT_FOUND = "DA7817 form not found"
HTTP_ERROR_MESSAGE_SOLDIER_NOT_FOUND = "Error: Recording Soldier not present in database"
HTTP_ERROR_MESSAGE_INVALID_GET_TRANSFER = "Error: Invalid/Missing Value for get_type in Transfer Request GET call"
# XML Errors
HTTP_400_XML_MISSING_REQUIRED_FIELDS = "Error: Supplied XML file is missing required fields"
# DA7817 Errors
HTTP_404_DA7817_DOES_NOT_EXIST = "DA Form 7817 does not exist"
HTTP_404_EVENT_TYPE_DOES_NOT_EXIST = "Event Type does not exist"
HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST = "Training Type does not exist"
HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST = "Evaluation Type does not exist"
HTTP_404_AWARD_TYPE_DOES_NOT_EXIST = "Award Type does not exist"
HTTP_404_TCS_LOCATION_DOES_NOT_EXIST = "TCS Location does not exist"
# DA4856 Errors
HTTP_404_DA4856_DOES_NOT_EXIST = "DA Form 4856 does not exist"
# Supporting Document Errors
HTTP_404_SUPPORTING_DOCUMENT_DOES_NOT_EXIST = "Supporting Document does not exist"
HTTP_404_SUPPORTING_DOCUMENT_TYPE_DOES_NOT_EXIST = "Supporting Document Type does not exist"
# HTTP Response Status Codes
HTTP_SUCCESS_STATUS_CODE = 200
HTTP_PARTIAL_SUCCESS_STATUS_CODE = 206
HTTP_BAD_RESPONSE_STATUS_CODE = 400
HTTP_BAD_SERVER_STATUS_CODE = 500
HTTP_RESPONSE_NOT_FOUND_STATUS_CODE = 404
