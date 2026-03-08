class FraudRiskEngine:

    def __init__(self, expected_total, requested_total):
        self.expected_total = float(expected_total)
        self.requested_total = float(requested_total)
        self.risk_points = 0
        self.reasons = []
        self.extra_info = {}

    def check_discrepancy(self):
        if self.requested_total > self.expected_total:
            diff = self.requested_total - self.expected_total
            # Calculate percentage difference based on expected total
            if self.expected_total > 0:
                perc = (diff / self.expected_total) * 100
            else:
                perc = 100 # If expected is 0, any request is 100% diff

            if perc > 50:
                self.risk_points = 100
                self.reasons.append(f"CRITICAL: Requested amount (₹{self.requested_total}) is over 50% higher than expected (₹{self.expected_total})")
            elif perc > 20:
                self.risk_points = 70
                self.reasons.append(f"HIGH: Requested amount (₹{self.requested_total}) is significantly higher (>{perc:.1f}%) than expected")
            elif perc > 0:
                self.risk_points = 40
                self.reasons.append(f"MEDIUM: Requested amount (₹{self.requested_total}) slightly exceeds expected (₹{self.expected_total})")
        else:
            # If charges are within expected or lower
            # Small risk points if manual charges are present even if total is ok
            manual_sum = self.extra_info.get("waiting", 0) + self.extra_info.get("loading", 0) + self.extra_info.get("detention", 0)
            if manual_sum > 0:
                self.risk_points = 10
                self.reasons.append(f"MINOR: Manual charges of ₹{manual_sum} requested but within total budget")

    def risk_level(self):
        if self.risk_points == 0:
            return "Low"
        elif self.risk_points < 40:
            return "Low"
        elif self.risk_points < 70:
            return "Medium"
        else:
            return "High"

    def run(self):
        self.check_discrepancy()
        
        return {
            "fraud_probability": float(self.risk_points),
            "risk_level": self.risk_level(),
            "reasons": self.reasons,
            "requested_total": self.requested_total,
            "expected_total": self.expected_total
        }