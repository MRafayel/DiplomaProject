def allocate_budget(projects: dict, budget: int, data: dict, step: int) -> tuple:
    remaining_budget = budget
    allocation = {}

    for project_name in reversed(list(projects.keys())):
        buckets = projects[project_name]

        valid_options = {
            budget: data
            for budget, data in buckets.items()
            if data["suggested_investment"] <= remaining_budget
        }

        if not valid_options:
            allocation[project_name] = {
                "budget_during_investment": remaining_budget,
                "investment": 0,
                "expected_return": 0
            }
            continue

        _, best_data = max(
            valid_options.items(),
            key=lambda item: item[1]["expected_return"]
        )

        investment = best_data["suggested_investment"]

        real_return = data[project_name][investment // step]

        allocation[project_name] = {
            "budget_during_investment": remaining_budget,
            "investment": best_data["suggested_investment"],
            "expected_return": int(real_return)
        }

        remaining_budget -= best_data["suggested_investment"]

    total_return = sum(
        item["expected_return"]
        for item in allocation.values()
        if item is not None
    )

    return allocation, remaining_budget, total_return


def main():
    pass


if __name__ == '__main__':
    main()
