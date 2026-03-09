import matplotlib.pyplot as plt


def fraud_probability_graph(score):

    plt.figure()
    plt.bar(["Fraud Risk"], [score])
    plt.ylim(0, 100)
    plt.title("Fraud Probability %")

    plt.show()


def freight_comparison(expected, actual):

    plt.figure()

    labels = ["Expected Freight", "Invoice Freight"]
    values = [expected, actual]

    plt.bar(labels, values)

    plt.title("Freight Comparison")

    plt.show()


def risk_reason_graph(reasons):

    plt.figure()

    values = [10] * len(reasons)

    plt.bar(reasons, values)

    plt.title("Fraud Risk Factors")

    plt.xticks(rotation=30)

    plt.show()