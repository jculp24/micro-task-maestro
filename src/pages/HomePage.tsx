
import { useState, useEffect } from "react";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilters from "@/components/tasks/TaskFilters";
import UserStats from "@/components/user/UserStats";
import { useUser } from "@/providers/UserProvider";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/types/task";
import { mockTasks } from "@/data/mockTasks";

const HomePage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadTasks = () => {
      setIsLoading(true);
      setTimeout(() => {
        setTasks(mockTasks);
        setIsLoading(false);
      }, 800);
    };
    
    loadTasks();
  }, []);

  useEffect(() => {
    // Show welcome toast when the component mounts
    toast({
      title: "Welcome back!",
      description: `You've earned $${user?.earningsToday.toFixed(2)} today.`,
      duration: 3000,
    });
  }, []);

  const filteredTasks = selectedCategory 
    ? tasks.filter(task => task.category === selectedCategory) 
    : tasks;

  return (
    <div className="py-4 space-y-6">
      <UserStats />
      
      <TaskFilters 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      <h2 className="text-xl font-semibold">Available Tasks</h2>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="h-36 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          
          {filteredTasks.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No tasks available in this category. Try another filter!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
