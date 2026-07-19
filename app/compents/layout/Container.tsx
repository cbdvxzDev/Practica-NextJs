import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  clean?: boolean;
}

export function Container({
  className,
  as: Component = "div",
  clean = false,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        // Si "clean" es true, remueve las reglas de centrado para casos de layouts fluidos a pantalla completa
        !clean && "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  );
}