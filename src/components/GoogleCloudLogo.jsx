import googleCloudLogo from '../assets/Google-Cloud-Logo.png';

export default function GoogleCloudLogo({ className = "h-12 w-auto" }) {
  return (
    <img
      src={googleCloudLogo}
      alt="Google Cloud"
      className={className}
    />
  );
}
