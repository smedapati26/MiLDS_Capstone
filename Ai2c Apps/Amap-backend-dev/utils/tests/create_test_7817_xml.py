def create_test_7817_xml():
    with open("static/xml/DA_FORM_7817_Best_Wrench_data_full.xml", "rb") as xml_file:
        xml_content = xml_file.read()
    return xml_content
