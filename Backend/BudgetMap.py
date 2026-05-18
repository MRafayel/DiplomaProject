def build_budget_map(budget_limit: int, step: int, project_names: list, data: dict) -> dict:
    res_dict = {}
    first_project_name = project_names[0]

    if step <= 0:
        raise ValueError("step must be > 0")

    for name in project_names:
        res_dict[name] = {key: {"suggested_investment": key if first_project_name == name else 0,
                                "expected_return": data.get(first_project_name)[key // step]
                                if first_project_name == name else 0}
                          for key in range(0, budget_limit + 1, step)}

    return res_dict


def main():
    pass


if __name__ == '__main__':
    main()
