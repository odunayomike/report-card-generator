import paystackLogo from '../assets/Paystack_Logo.png';

export default function PaystackLogo({ className = "w-32 h-auto" }) {
  return (
    <img
      src={paystackLogo}
      alt="Paystack"
      className={className}
    />
  );
}
