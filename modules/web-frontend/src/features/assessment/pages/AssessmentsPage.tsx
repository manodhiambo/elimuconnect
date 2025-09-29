import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { FileText, Clock, Award } from 'lucide-react';
// import { Button } from '../../../components/ui/Button';

export const AssessmentsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assessments</h1>
        <p className="text-muted-foreground">Take quizzes and track your progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">24</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The assessment system is under development. Soon you'll be able to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Take interactive quizzes</li>
            <li>View your scores and progress</li>
            <li>Get personalized recommendations</li>
            <li>Practice with past papers</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
