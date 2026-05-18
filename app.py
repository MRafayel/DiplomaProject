from flask import Flask, render_template, request, jsonify

from Backend.Optimizer import optimize_investments
from Backend.Parse import parse_file
from Backend.ValidateShape import validate_data_shape
from Backend.ValidateInputs import validate_inputs
from Backend.Interpolate import interpolate_data
from Backend.AI import explain_result

app = Flask(__name__, template_folder="Frontend/templates", static_folder="Frontend/static")


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/optimize', methods=['POST'])
def optimize():
    try:
        file = request.files['file']
        budget = int(request.form['budget'])
        step = int(request.form['step'])
        mode = request.form.get('mode', 'strict')

        validate_inputs(budget=budget, step=step)

        data = parse_file(file=file)

        if mode == "strict":
            validate_data_shape(data, budget, step)

        elif mode == "flexible":
            data = interpolate_data(data, step, budget)

        result, dp_state = optimize_investments(
            data=data,
            budget_limit=budget,
            steps=step
        )

        explanation = explain_result(allocation=result[0], total_return=result[2], budget=budget) #AI explanation

        return jsonify({
            "allocation": result[0],
            "remaining_budget": result[1],
            "total_return": result[2],
            "dp_state": dp_state,
            "explanation": explanation,
        })

    except ValueError as e:
        print(f"[VALUEERROR] {e}")
        return jsonify({
            "error": True,
            "message": str(e)
        }), 400

    except Exception as e:
        print(f"[EXCEPTION] {e}")
        return jsonify({
            "error": True,
            "message": "Internal server error",
            "details": str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True)