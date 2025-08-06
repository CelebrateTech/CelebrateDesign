using Microsoft.AspNetCore.Mvc;

namespace CelebrateDesign.Controllers
{
    public class DataController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
