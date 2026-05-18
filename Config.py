import os
from dotenv import load_dotenv

load_dotenv()

API = os.getenv("GEM_API")

in_data = {
    'Mobile_Network': [32, 62, 85, 107, 126, 142, 155, 165],
    'PON_25G': [24, 45, 75, 108, 140, 168, 192, 210],
    'AI_Infrastructure': [30, 65, 105, 140, 165, 180, 190, 195],
    'Green_Projects': [10, 22, 36, 52, 70, 88, 105, 120]
}

