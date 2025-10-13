import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, MessageCircle, FileText, Zap, BarChart3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const features = [
    {
      icon: FolderKanban,
      title: "Projects",
      description: "Organize tasks and collaborate seamlessly with your team on multiple projects.",
    },
    {
      icon: MessageCircle,
      title: "Chat",
      description: "Real-time messaging keeps your team connected and conversations organized.",
    },
    {
      icon: FileText,
      title: "Files",
      description: "Store, share, and manage all your documents in one secure location.",
    },
    {
      icon: Zap,
      title: "Rules",
      description: "Automate workflows with smart rules that save time and reduce errors.",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Get insights into team performance and project progress with powerful analytics.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
     
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl text-center animate-fade-up">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Simplify your team's workflow with{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Opsync
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl">
              The all-in-one business operations platform that brings together projects, communication, 
              files, automation, and analytics in one powerful workspace.
            </p>
            <Button 
              variant="hero" 
              size="lg" 
              className="text-base md:text-lg px-8 py-6 h-auto"
              onClick={() => navigate(isLoggedIn ? "/projects" : "/login")}
            >
              {isLoggedIn ? "Go to My Projects" : "Get Started"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

     
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything you need in one place
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Powerful tools designed to streamline operations and boost productivity
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-scale-in border-border/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-md transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

     
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden border-0 bg-gradient-primary shadow-glow">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl md:text-5xl">
                Ready to transform your workflow?
              </h2>
              <p className="mb-8 text-lg text-primary-foreground/90 md:text-xl">
                Join teams already using Opsync to work smarter, not harder.
              </p>
              <Button 
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90 shadow-lg text-base md:text-lg px-8 py-6 h-auto"
                onClick={() => navigate("/register")}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="bg-background/90 text-muted-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Opsync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;