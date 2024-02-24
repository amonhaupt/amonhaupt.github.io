from deep_translator import GoogleTranslator

# Dieses Skript übersetzt die Klassen für das Objekterkenungsmodell aus dem Englischen ins Deutsche.

filename = "classes.txt"
target_string = "displayName"

def get_lines_with_string(filename, target_string): # sucht nach jeder Zeile die "displayName" enthält
    with open(filename, "r") as file:
        lines = file.readlines()
        lines_with_string = []
        for line in lines:
            if target_string in line:
                lines_with_string.append(line)
    return lines_with_string

result = get_lines_with_string(filename, target_string)

cleaned_strings = []

def clean_strings(result): # Löscht alles aus der Zeile außer dem Klassennamen
    for line in result:
        a = line.strip()
        b = a.replace("displayName: '", "")
        c = b.replace("',", "")
        cleaned_strings.append(c)

clean_strings(result)

cleaned_strings.pop(0) # löscht erstes Element in der Liste, da es kein relevantes Wort enthält

print(cleaned_strings) # gibt Liste mit englischen Wörtern aus

translated_strings = []

for line in cleaned_strings:
    a = GoogleTranslator(source='auto', target='de').translate(line) # Übersetzt jedes Wort in der Liste ins Deutsche.
    translated_strings.append(a)

print(translated_strings) # gibt Liste mit deutschen Wörtern aus
