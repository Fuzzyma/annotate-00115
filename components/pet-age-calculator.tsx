"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateHumanAge,
  getBreedsBySpecies,
  getUniqueSpecies,
} from "@/lib/age-utils";
import petAgingData from "@/data/pet-aging-data.json";
import type { PetAgeData } from "@/lib/types";
import { AlertCircle, Calculator } from "lucide-react";

// Form schema with validation
const formSchema = z.object({
  species: z.string().min(1, { message: "Please select a species" }),
  breed: z.string().min(1, { message: "Please select a breed" }),
  petAge: z.coerce
    .number()
    .positive({ message: "Age must be a positive number" }),
});

export default function PetAgeCalculator() {
  const [humanAge, setHumanAge] = useState<number | null>(null);
  const [availableBreeds, setAvailableBreeds] = useState<string[]>([]);
  const data = petAgingData as PetAgeData[];
  const species = getUniqueSpecies(data);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      species: "",
      breed: "",
      petAge: 1,
    },
    mode: "onChange", // Validate on change
  });

  const { watch, formState } = form;
  const watchedValues = watch();
  const selectedSpecies = watch("species");

  // Update available breeds when species changes
  useEffect(() => {
    if (selectedSpecies) {
      const breeds = getBreedsBySpecies(selectedSpecies, data);
      setAvailableBreeds(breeds);

      // Reset breed selection when species changes
      form.setValue("breed", "");
    } else {
      setAvailableBreeds([]);
    }
  }, [selectedSpecies, data, form]);

  // Calculate human age whenever form values change
  useEffect(() => {
    if (
      formState.isValid &&
      watchedValues.species &&
      watchedValues.breed &&
      watchedValues.petAge
    ) {
      const age = calculateHumanAge(
        watchedValues.species,
        watchedValues.breed,
        watchedValues.petAge,
        data
      );
      setHumanAge(age);
    } else {
      setHumanAge(null);
    }
  }, [watchedValues, formState.isValid, data]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Pet Age Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Species</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a species" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {species.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breed</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedSpecies}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a breed" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableBreeds.map((breed) => (
                        <SelectItem key={breed} value={breed}>
                          {breed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="petAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pet Age (in years)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your pet's age"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-6 overflow-hidden border rounded-lg shadow-sm transition-all duration-200">
              <div className="bg-primary/10 px-4 py-3 border-b">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Age Calculation Result
                </h3>
              </div>
              <div className="p-4 bg-card">
                {formState.isValid && humanAge !== null ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        Your {watchedValues.species} ({watchedValues.breed}) is
                      </span>
                    </div>
                    <div className="text-center py-3">
                      <span className="text-4xl font-bold text-primary">
                        {humanAge.toFixed(1)}
                      </span>
                      <span className="text-xl ml-2">human years old</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center italic">
                      Based on species-specific aging patterns
                    </p>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-muted-foreground">
                      {Object.keys(formState.errors).length > 0 ? (
                        <span className="flex items-center justify-center gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          Please fix the validation errors to see the result
                        </span>
                      ) : (
                        "Fill out the form to calculate your pet's human age"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
