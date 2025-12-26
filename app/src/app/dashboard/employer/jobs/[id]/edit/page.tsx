"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { supabaseBrowser } from "@/lib/supabase/client"
import { updateJob } from "../../actions"

const EditSchema = z.object({
  title: z.string().min(4),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  employment_type: z.string().optional(),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  currency: z.string().optional(),
  description: z.string().min(20),
  requirements: z.string().optional(),
  is_active: z.boolean().optional(),
})

type EditValues = z.infer<typeof EditSchema>

export default function EditEmployerJobPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const id = params.id

  const [loading, setLoading] = React.useState(true)
  const [remote, setRemote] = React.useState(false)
  const [active, setActive] = React.useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<EditValues>({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      location: "",
      employment_type: "",
      currency: "USD",
      salary_min: "",
      salary_max: "",
      remote: false,
      is_active: true,
    },
  })

  React.useEffect(() => {
    const supabase = supabaseBrowser()
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("jobs")
        .select("id,title,location,remote,employment_type,salary_min,salary_max,currency,description,requirements,is_active")
        .eq("id", params.id)
        .maybeSingle()

      if (error || !data) {
        toast.error("Job not found.")
        setLoading(false)
        return
      }

      reset({
        title: data.title ?? "",
        location: data.location ?? "",
        remote: Boolean(data.remote ?? false),
        employment_type: data.employment_type ?? "",
        salary_min: data.salary_min != null ? String(data.salary_min) : "",
        salary_max: data.salary_max != null ? String(data.salary_max) : "",
        currency: data.currency ?? "USD",
        description: data.description ?? "",
        requirements: data.requirements ?? "",
        is_active: Boolean(data.is_active ?? true),
      })
      setRemote(Boolean(data.remote ?? false))
      setActive(Boolean(data.is_active ?? true))
      setLoading(false)
    })()
  }, [params.id, reset])

  const onSubmit = async (values: EditValues) => {
    const salaryMin = values.salary_min ? Number(values.salary_min) : null
    const salaryMax = values.salary_max ? Number(values.salary_max) : null

    const result = await updateJob(params.id, {
      title: values.title,
      description: values.description,
      requirements: values.requirements,
      employment_type: values.employment_type,
      location: values.location,
      remote: Boolean(values.remote),
      salary_min: salaryMin != null && !Number.isNaN(salaryMin) ? salaryMin : null,
      salary_max: salaryMax != null && !Number.isNaN(salaryMax) ? salaryMax : null,
      currency: values.currency,
      is_active: Boolean(values.is_active),
    })

    if (!result.ok) {
      toast.error(result.error ?? "Could not save changes.")
      return
    }

    toast.success("Job updated.")
    router.push(`/dashboard/employer/jobs/${params.id}`)
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-16">
        <PageHeader title="Edit job" description="Loading…" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHeader title="Edit job" description="Adjust details, then keep an eye on applicants." />

      <form
        className="space-y-6 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <Label htmlFor="title">Role title</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={4} {...register("description")} />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea id="requirements" rows={4} {...register("requirements")} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="employment_type">Employment type</Label>
            <Input id="employment_type" {...register("employment_type")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={remote}
            onCheckedChange={(checked) => {
              setRemote(checked)
              setValue("remote", checked)
            }}
          />
          <span className="text-sm text-foreground">Remote</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" {...register("currency")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary_min">Min salary</Label>
            <Input id="salary_min" type="number" {...register("salary_min")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary_max">Max salary</Label>
            <Input id="salary_max" type="number" {...register("salary_max")} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={active}
            onCheckedChange={(checked) => {
              setActive(checked)
              setValue("is_active", checked)
            }}
          />
          <span className="text-sm text-foreground">Live</span>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  )
}


