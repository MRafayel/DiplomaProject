def validate_inputs(budget, step):
    if step <= 0:
        raise ValueError("Step must be > 0")

    if budget % step != 0:
        raise ValueError(
            "Budget must be divisible by step (discrete DP constraint)"
        )


def main():
    pass


if __name__ == '__main__':
    main()
