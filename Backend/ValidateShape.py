def validate_data_shape(data, budget, step):
    expected_len = (budget // step) + 1

    first_len = len(next(iter(data.values())))

    if first_len != expected_len:
        raise ValueError(
            f"Strict mode error: expected {expected_len} rows per project, got {first_len}"
        )


def main():
    pass


if __name__ == '__main__':
    main()
