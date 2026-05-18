from Config import in_data
from Backend.AllocateBudget import allocate_budget
from Backend.BudgetMap import build_budget_map


def optimize_investments(data: dict, budget_limit: int, steps: int) -> tuple:
    project_names = list(data.keys())
    n_projects = len(project_names)

    projects = build_budget_map(budget_limit=budget_limit, step=steps, project_names=project_names, data=data)

    for i in range(1, n_projects):

        project_name = project_names[i]
        returns = data.get(project_name, [])

        for budget in range(0, budget_limit + steps, steps):

            for suggested_investment in range(0, budget + steps, steps):

                idx_expected_return = suggested_investment // steps
                expected_return = returns[idx_expected_return] + projects[project_names[i-1]][budget - suggested_investment]["expected_return"]

                if expected_return > projects[project_name][budget]["expected_return"]:
                    projects[project_name].update({budget: {"suggested_investment": suggested_investment,
                                                            "expected_return": expected_return}})

    return allocate_budget(projects=projects, budget=budget_limit, data=data, step=steps), projects


def main():
    budget_we_have = 160
    result_matrix = optimize_investments(in_data, budget_we_have, steps=20)
    print("=" * 20, "\n")
    print(f"[RESULT MATRIX] \n{result_matrix}")


if __name__ == '__main__':
    main()
