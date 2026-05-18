import pandas as pd


def interpolate_data(data, step, budget):
    df = pd.DataFrame(data)

    expected_len = (budget // step) + 1
    current_len = len(df)

    if current_len == expected_len:
        return data  # no need

    # reindex to full range
    df = df.reindex(range(expected_len))

    df = df.interpolate(method="linear", limit_direction="both")
    # convert back to dict
    return {col: df[col].astype(int).tolist() for col in df.columns}

def main():
    pass


if __name__ == '__main__':
    main()
