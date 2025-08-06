using Microsoft.AspNetCore.Mvc;

namespace CelebrateDesign.Controllers
{
    public class PagesController : Controller
    {
        public IActionResult Landing1()
        {
            return View();
        }
        public IActionResult Landing2()
        {
            return View();
        }
        public IActionResult SideNav1()
        {
            return View();
        }
        public IActionResult SideNav2()
        {
            return View();
        }

        public IActionResult Login_v1()
        {
            return View();
        }
        public IActionResult Forget_Password()
        {
            return View();
        }

        public IActionResult Apps()
        {
            return View();
        }

        public IActionResult AddData()
        {
            return View();
        }
    }
}
