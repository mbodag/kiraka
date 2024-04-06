import random
import numpy as np

T = 30
WPM = 100
W = 0.1

webgazer_data = [[random.randint(0, 99), random.randint(0, 99), i + 1] for i in range(4 * T + 1)]
print(webgazer_data)

weightings = [
    [-10, 0, 5, 5, 10],
    [-10, -5, 0, 5, 10],
    [-10, -5, -5, 0, 10]
]


def get_section_from_position(x):
    return (x // 20) + 1


def calculate_performance_from_data(data, T, weightings, WPM, W):
    # Initialisation
    performance = 0
    time_spent_in_sections = [0] * 5
    start_timestamp = data[0][2]
    previous_timestamp = start_timestamp
    next_flip = 1
    WPM_changes = []

    for (x, y, timestamp) in data:
        elapsed_time = timestamp - previous_timestamp
        previous_timestamp = timestamp

        t = timestamp - start_timestamp  # full time
        section_index = get_section_from_position(x) - 1

        # Determine the current period based on elapsed time
        if t % T <= T / 3:
            current_weightings = weightings[0]
        elif t % T <= 2 * T / 3:
            current_weightings = weightings[1]
        else:
            current_weightings = weightings[2]

        time_spent_in_sections[section_index] += elapsed_time

        if t // T == next_flip:
            performance += sum(np.array(time_spent_in_sections) * np.array(current_weightings))
            WPM += W * performance
            performance = 0
            WPM_changes.append(WPM)
            next_flip = t // T + 1

    return WPM_changes


WPM_changes = calculate_performance_from_data(webgazer_data, T, weightings, WPM, W)
print(len(webgazer_data))
print(f"Changes in WPM: {WPM_changes}")