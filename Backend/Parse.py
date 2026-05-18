import pandas as pd


def parse_file(file):
    filename = file.filename.lower()

    if filename.endswith('.csv'):
        df = pd.read_csv(file)

    elif filename.endswith('.xlsx'):
        df = pd.read_excel(file, engine='openpyxl')

    else:
        raise ValueError("Unsupported file format")

    data = {col: df[col].dropna().astype(int).tolist() for col in df.columns}

    return data


def main():
    pass


if __name__ == '__main__':
    main()
