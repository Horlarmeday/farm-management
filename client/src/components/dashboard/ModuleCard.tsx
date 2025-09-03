import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ModuleCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  onViewAll?: () => void;
  image?: string;
}

export default function ModuleCard({
  title,
  icon,
  children,
  onViewAll,
  image,
}: ModuleCardProps) {
  return (
    <Card className="farm-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-primary hover:text-primary/80"
            >
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {image && (
          <div className="w-full h-32 rounded-lg overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
