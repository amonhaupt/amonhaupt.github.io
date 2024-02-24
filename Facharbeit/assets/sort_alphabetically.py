def sort_by_alphabet():
    with open("Quellen.txt", "r") as file:
        lines = file.readlines()

    sorted_lines = sorted(lines)
    
    with open("sortierte_Quellen.txt", "w") as file:
        for line in sorted_lines:
            file.write(line)

sort_by_alphabet()