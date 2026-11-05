import {
  Activity,
  Apple,
  Baby,
  Bandage,
  Bone,
  Brain,
  Bug,
  Droplet,
  Dumbbell,
  Eye,
  HeartPulse,
  Hospital,
  Leaf,
  Moon,
  Pill,
  Shield,
  Sparkles,
  Stethoscope,
  Thermometer,
  Wind,
  type LucideIcon,
} from "lucide-react";

/**
 * Presentation metadata for DrugSetu categories. Names and IDs always come from
 * the API; this only picks an icon and a neutral, non-claim description by keyword.
 */
const RULES: Array<{ test: RegExp; icon: LucideIcon; blurb: string }> = [
  { test: /infect|malaria|antibiot/i, icon: Bug, blurb: "Anti-infective and anti-malarial formulations." },
  { test: /diabet|chronic/i, icon: Activity, blurb: "Therapies used in long-term condition management." },
  { test: /pain|analges|fever|headache/i, icon: Thermometer, blurb: "Analgesic and antipyretic formulations." },
  { test: /gastro|stomach/i, icon: Droplet, blurb: "Gastrointestinal and digestive care products." },
  { test: /respir|cold|air/i, icon: Wind, blurb: "Respiratory and seasonal care products." },
  { test: /vitamin|nutrition|supplement|food|diet|drink/i, icon: Apple, blurb: "Vitamins, nutrition and supplement lines." },
  { test: /baby|kid|mother|maternity/i, icon: Baby, blurb: "Paediatric, maternal and baby-care products." },
  { test: /women|feminine|intimate|sexual|men/i, icon: HeartPulse, blurb: "Specialised personal health categories." },
  { test: /mental|cognitive|sleep/i, icon: Brain, blurb: "Products supporting sleep and cognitive health." },
  { test: /eye|ear/i, icon: Eye, blurb: "Ophthalmic and otic care products." },
  { test: /ayur|herbal|homeo|organic|vegan|plant/i, icon: Leaf, blurb: "Ayurvedic, herbal and plant-based ranges." },
  { test: /fitness|sport|weight/i, icon: Dumbbell, blurb: "Sports, fitness and weight-management lines." },
  { test: /rehab|physio|ergonomic|elderly/i, icon: Bone, blurb: "Rehabilitation, mobility and elderly care." },
  { test: /first aid|essential/i, icon: Bandage, blurb: "First-aid and everyday essentials." },
  { test: /hospital|professional|device|aid/i, icon: Hospital, blurb: "Hospital supplies, devices and aids." },
  { test: /immun|preventive|wellness/i, icon: Shield, blurb: "Immunity and preventive health products." },
  { test: /personal|hair|skin/i, icon: Sparkles, blurb: "Personal care and grooming products." },
  { test: /service|corporate/i, icon: Stethoscope, blurb: "Healthcare service and corporate wellness lines." },
  { test: /travel|seasonal/i, icon: Moon, blurb: "Travel and seasonal health essentials." },
];

export function categoryMeta(name: string): { icon: LucideIcon; blurb: string } {
  const rule = RULES.find((r) => r.test.test(name));
  return rule ?? { icon: Pill, blurb: "Browse catalogue products listed in this category." };
}
