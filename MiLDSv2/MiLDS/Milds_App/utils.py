# aircraft/utils.py
def sanitize_data(entry):
    entry['current_unit'] = "WDDRA0"
    entry['location'] = 1
    # Handle date sanitization...
    return entry
