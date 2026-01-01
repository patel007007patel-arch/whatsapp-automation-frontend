import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { planAPI, userAPI } from 'src/services/api';
import { useNavigate } from 'react-router';
import { Icon } from '@iconify/react';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import { Badge } from 'src/components/ui/badge';

const Plans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
    fetchCurrentPlan();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await planAPI.getPlans();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPlan = async () => {
    try {
      const data = await userAPI.getProfile();
      setCurrentPlan(data.user);
    } catch (error) {
      console.error('Failed to fetch current plan:', error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      await planAPI.subscribe(planId);
      alert('Plan subscribed successfully! Redirecting to WhatsApp Connect...');
      navigate('/user/whatsapp/connect');
    } catch (error: any) {
      alert(error.message || 'Failed to subscribe. Please try again.');
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!confirm('Are you sure you want to upgrade to this plan?')) {
      return;
    }
    await handleSubscribe(planId);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const currentPlanId = currentPlan?.plan?._id || currentPlan?.plan;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-muted-foreground">Choose the perfect plan for your needs</p>
      </div>

      <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <Icon icon="solar:info-circle-linear" className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Important:</strong> 1 Credit = 1 Message. Credits are deducted for each message sent.
        </AlertDescription>
      </Alert>

      {currentPlan?.plan && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Plan</span>
              <Badge variant="default">{currentPlan.plan.name}</Badge>
            </CardTitle>
            <CardDescription>
              You are currently subscribed to the {currentPlan.plan.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Credits Remaining</p>
                <p className="text-2xl font-bold">{currentPlan.credits || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan Credits</p>
                <p className="text-2xl font-bold">{currentPlan.plan.credits || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={currentPlan.subscription?.status === 'active' ? 'default' : 'secondary'}>
                  {currentPlan.subscription?.status || 'expired'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan._id;
          const credits = plan.credits || 0;

          return (
            <Card
              key={plan._id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                plan.isPopular ? 'border-primary border-2 scale-105' : ''
              } ${isCurrentPlan ? 'border-green-500 border-2' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  Popular
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-br-lg">
                  Current Plan
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">{plan.description || 'Perfect for getting started'}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">₹{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/{plan.duration} days</span>
                  </div>
                  {plan.price > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ₹{(plan.price / plan.duration).toFixed(2)} per day
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-lightprimary dark:bg-darkprimary rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Credits Included</p>
                      <p className="text-3xl font-bold text-primary">{credits.toLocaleString()}</p>
                    </div>
                    <Icon icon="solar:wallet-linear" className="h-12 w-12 text-primary opacity-50" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">1 Credit = 1 Message</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold">Features:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Icon
                        icon={plan.features.media ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                        className={`h-5 w-5 mr-2 ${plan.features.media ? 'text-green-500' : 'text-gray-400'}`}
                      />
                      <span className={plan.features.media ? '' : 'text-muted-foreground'}>Media Support</span>
                    </li>
                    <li className="flex items-center">
                      <Icon
                        icon={plan.features.polls ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                        className={`h-5 w-5 mr-2 ${plan.features.polls ? 'text-green-500' : 'text-gray-400'}`}
                      />
                      <span className={plan.features.polls ? '' : 'text-muted-foreground'}>Polls</span>
                    </li>
                    <li className="flex items-center">
                      <Icon
                        icon={plan.features.bulkMessages ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                        className={`h-5 w-5 mr-2 ${plan.features.bulkMessages ? 'text-green-500' : 'text-gray-400'}`}
                      />
                      <span className={plan.features.bulkMessages ? '' : 'text-muted-foreground'}>Bulk Messages</span>
                    </li>
                    <li className="flex items-center">
                      <Icon
                        icon={plan.features.apiAccess ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                        className={`h-5 w-5 mr-2 ${plan.features.apiAccess ? 'text-green-500' : 'text-gray-400'}`}
                      />
                      <span className={plan.features.apiAccess ? '' : 'text-muted-foreground'}>API Access</span>
                    </li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="pt-4">
                {isCurrentPlan ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(plan._id)}
                    variant={plan.isPopular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.price === 0 ? 'Get Started Free' : currentPlan?.plan ? 'Upgrade Plan' : 'Subscribe Now'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon icon="solar:tag-price-linear" className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No Plans Available</p>
            <p className="text-muted-foreground">Contact administrator to create subscription plans.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Plans;
