import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle, Clock, Shield, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <CalendarDays className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">StaffHub</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium text-muted-foreground hover:text-primary">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full px-6 shadow-lg shadow-primary/20">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Streamline your time-off requests
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-foreground leading-[1.1]">
                Medical-Grade <br/>
                <span className="text-primary">Staff Management</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
                Empower your healthcare facility with precise, automated time-off management. 
                Focus on patient care while we handle the schedule.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="rounded-full w-full sm:w-auto h-14 px-10 text-lg shadow-xl shadow-primary/20">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full w-full sm:w-auto h-14 px-10 text-lg border-2 hover:bg-secondary"
                  >
                    Employee Login
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[3rem] blur-3xl opacity-30 transform translate-x-10 translate-y-10"></div>
              <div className="relative bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/10">
                <div className="space-y-6">
                   {/* Decorative UI elements mimicking the app interface */}
                   <div className="flex items-center justify-between mb-8">
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 bg-secondary rounded-full"></div>
                        <div className="h-3 w-24 bg-secondary/60 rounded-full"></div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10"></div>
                   </div>
                   <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white shadow-sm shrink-0"></div>
                        <div className="space-y-2 w-full">
                          <div className="h-3 w-3/4 bg-white rounded-full"></div>
                          <div className="h-2 w-1/2 bg-white/60 rounded-full"></div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white shadow-sm shrink-0"></div>
                        <div className="space-y-2 w-full">
                          <div className="h-3 w-3/4 bg-white rounded-full"></div>
                          <div className="h-2 w-1/2 bg-white/60 rounded-full"></div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 shrink-0 flex items-center justify-center">
                           <CheckCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-2 w-full">
                          <div className="h-3 w-3/4 bg-primary/20 rounded-full"></div>
                          <div className="h-2 w-1/2 bg-primary/10 rounded-full"></div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-secondary/30 rounded-[3rem] mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Precision in Every Shift</h2>
            <p className="text-muted-foreground text-lg">
              Our system ensures staffing requirements are met while giving employees the flexibility they need.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<CalendarDays className="w-6 h-6" />}
              title="Easy Requests"
              description="Submit time-off requests in seconds with our intuitive form."
            />
            <FeatureCard
              icon={<CheckCircle className="w-6 h-6" />}
              title="Quick Approvals"
              description="One-click approve or deny with automatic email notifications."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Team Calendar"
              description="See who's away at a glance to avoid scheduling conflicts."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Secure & Private"
              description="Enterprise-grade security keeps your staff data protected."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="bg-primary rounded-[2.5rem] p-12 sm:p-24 text-center text-primary-foreground relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>
             <h2 className="text-3xl sm:text-4xl font-bold mb-6 relative z-10">
                Ready to simplify your workflow?
              </h2>
              <p className="text-primary-foreground/80 mb-10 max-w-xl mx-auto text-lg relative z-10">
                Join teams who have eliminated the headache of manual time-off
                tracking.
              </p>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="rounded-full h-14 px-10 text-primary font-bold text-lg shadow-xl relative z-10">
                  Get Started Now
                </Button>
              </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <CalendarDays className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg text-foreground">StaffHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StaffHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-8 rounded-3xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
