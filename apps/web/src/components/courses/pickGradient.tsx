import { gradients } from "@/lib/contstant";

const pickGradient = (title: string) => {
  const sum = [...title].reduce((total, char) => total + char.charCodeAt(0), 0);
  return gradients[sum % gradients.length];
}

export default pickGradient;